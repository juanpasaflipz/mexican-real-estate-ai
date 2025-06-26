const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');
const logger = require('../utils/logger');

class PineconeService {
  constructor() {
    this.pinecone = null;
    this.openai = null;
    this.index = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Pinecone
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      });

      // Initialize OpenAI
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      // Get the index
      this.index = this.pinecone.index(process.env.PINECONE_INDEX_NAME);
      
      this.initialized = true;
      logger.info('Pinecone service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Pinecone service:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a text using OpenAI
   */
  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
        dimensions: 2048
      });
      
      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Create a property description for embedding
   */
  createPropertyDescription(property) {
    const parts = [
      `${property.property_type || 'Property'} in ${property.city}, ${property.state}`,
      property.neighborhood ? `Located in ${property.neighborhood}` : '',
      property.bedrooms ? `${property.bedrooms} bedrooms` : '',
      property.bathrooms ? `${property.bathrooms} bathrooms` : '',
      property.area_sqm || property.total_area_sqm || property.built_area_sqm ? `${property.area_sqm || property.total_area_sqm || property.built_area_sqm} square meters` : '',
      property.price ? `Price: ${property.price} MXN` : '',
      property.description || '',
      property.amenities ? `Amenities: ${JSON.stringify(property.amenities)}` : '',
      property.features ? `Features: ${JSON.stringify(property.features)}` : ''
    ].filter(Boolean);

    return parts.join('. ');
  }

  /**
   * Upsert property vectors to Pinecone
   */
  async upsertProperties(properties) {
    await this.initialize();

    const vectors = [];
    
    for (const property of properties) {
      try {
        const description = this.createPropertyDescription(property);
        const embedding = await this.generateEmbedding(description);
        
        vectors.push({
          id: property.id.toString(),
          values: embedding,
          metadata: {
            property_id: property.id,
            city: property.city || '',
            state: property.state || '',
            neighborhood: property.neighborhood || '',
            property_type: property.property_type || '',
            price: parseFloat(property.price) || 0,
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            square_meters: property.area_sqm || property.total_area_sqm || property.built_area_sqm || 0,
            title: property.title || '',
            description: property.description || ''
          }
        });

        // Upsert in batches of 100
        if (vectors.length >= 100) {
          await this.index.upsert(vectors);
          logger.info(`Upserted ${vectors.length} property vectors`);
          vectors.length = 0;
        }
      } catch (error) {
        logger.error(`Error processing property ${property.id}:`, error);
      }
    }

    // Upsert remaining vectors
    if (vectors.length > 0) {
      await this.index.upsert(vectors);
      logger.info(`Upserted final ${vectors.length} property vectors`);
    }
  }

  /**
   * Search for properties using vector similarity
   */
  async searchProperties(query, filters = {}, topK = 20) {
    await this.initialize();

    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(query);

      // Build filter object for Pinecone
      const pineconeFilter = {};
      
      if (filters.city) {
        pineconeFilter.city = { $eq: filters.city };
      }
      
      if (filters.state) {
        pineconeFilter.state = { $eq: filters.state };
      }
      
      if (filters.property_type) {
        pineconeFilter.property_type = { $eq: filters.property_type };
      }
      
      if (filters.min_price || filters.max_price) {
        pineconeFilter.price = {};
        if (filters.min_price) pineconeFilter.price.$gte = filters.min_price;
        if (filters.max_price) pineconeFilter.price.$lte = filters.max_price;
      }
      
      if (filters.bedrooms) {
        pineconeFilter.bedrooms = { $gte: filters.bedrooms };
      }
      
      if (filters.bathrooms) {
        pineconeFilter.bathrooms = { $gte: filters.bathrooms };
      }

      // Query Pinecone
      const queryResponse = await this.index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined
      });

      return queryResponse.matches.map(match => ({
        property_id: match.metadata.property_id || match.metadata.id,
        score: match.score,
        ...match.metadata
      }));
    } catch (error) {
      logger.error('Error searching properties:', error);
      throw error;
    }
  }

  /**
   * Delete property vectors from Pinecone
   */
  async deleteProperties(propertyIds) {
    await this.initialize();

    try {
      const ids = propertyIds.map(id => id.toString());
      await this.index.deleteMany(ids);
      logger.info(`Deleted ${ids.length} property vectors`);
    } catch (error) {
      logger.error('Error deleting property vectors:', error);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats() {
    await this.initialize();

    try {
      const stats = await this.index.describeIndexStats();
      return stats;
    } catch (error) {
      logger.error('Error getting index stats:', error);
      throw error;
    }
  }
}

module.exports = new PineconeService();