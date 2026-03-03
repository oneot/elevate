const { getPostsContainer } = require('../services/cosmosClient');

// Get all published posts
exports.getPublishedPosts = async (req, res) => {
  try {
    const container = getPostsContainer();
    
    // We only want published posts, and we don't necessarily need the full htmlBody for a list view
    const querySpec = {
      query: `SELECT p.id, p.slug, p.title, p.excerpt, p.authorUpn, p.tags, p.category, p.thumbnailUrl, p.publishedAt, p.createdAt, p.updatedAt 
              FROM p 
              WHERE p.status = 'published'
              ORDER BY p.publishedAt DESC`
    };

    const { resources: posts } = await container.items.query(querySpec).fetchAll();
    
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// Get a single post by slug
exports.getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const container = getPostsContainer();
    
    const querySpec = {
      query: `SELECT * FROM p WHERE p.slug = @slug AND p.status = 'published'`,
      parameters: [
        { name: "@slug", value: slug }
      ]
    };

    const { resources: items } = await container.items.query(querySpec).fetchAll();
    
    if (items.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    res.json(items[0]);
  } catch (error) {
    console.error(`Error fetching post with slug ${req.params.slug}:`, error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};
