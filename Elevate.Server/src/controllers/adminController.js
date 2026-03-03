const { getPostsContainer, getAssetsContainer } = require('../services/cosmosClient');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Utility to generate unique IDs
const generateId = () => crypto.randomBytes(16).toString('hex');

// Create a new post (POST /api/admin/posts)
exports.createPost = async (req, res) => {
  try {
    const { title, slug, htmlBody, excerpt, authorUpn, tags, category, thumbnailUrl, status } = req.body;
    
    // Validate required fields based on architecture schema
    if (!title || !slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    const container = getPostsContainer();
    
    // Check if slug already exists
    const querySpec = {
      query: `SELECT * FROM p WHERE p.slug = @slug`,
      parameters: [{ name: "@slug", value: slug }]
    };
    const { resources: existing } = await container.items.query(querySpec).fetchAll();
    if (existing.length > 0) {
      return res.status(409).json({ error: "Slug already exists. Please choose a unique slug." });
    }

    // Prepare document
    const now = new Date().toISOString();
    const newPost = {
      id: `post-${generateId()}`,
      partitionKey: "site#main",
      slug,
      title,
      htmlBody: htmlBody || "",
      excerpt: excerpt || "",
      status: status || "draft",
      authorUpn: authorUpn || "unknown", // In production, extract from Entra ID Token
      tags: tags || [],
      category: category || "Uncategorized",
      thumbnailUrl: thumbnailUrl || null,
      publishedAt: status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now
    };

    const { resource: createdItem } = await container.items.create(newPost);
    res.status(201).json(createdItem);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
};

// Update an existing post (PUT /api/admin/posts/:id)
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const container = getPostsContainer();
    const partitionKey = "site#main";

    // Read the existing item to ensure it exists and get its current state
    const { resource: existingPost, statusCode } = await container.item(id, partitionKey).read();
    
    if (statusCode === 404) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Merge updates
    const updatedPost = {
      ...existingPost,
      ...updateData,
      id, // ensure ID doesn't change
      partitionKey, // ensure PK doesn't change
      updatedAt: new Date().toISOString()
    };

    // If status changed to published, update publishedAt if not already set
    if (updateData.status === 'published' && existingPost.status !== 'published' && !existingPost.publishedAt) {
      updatedPost.publishedAt = new Date().toISOString();
    } else if (updateData.status === 'draft') {
      updatedPost.publishedAt = null;
    }

    const { resource: savedItem } = await container.item(id, partitionKey).replace(updatedPost);
    res.json(savedItem);
  } catch (error) {
    console.error(`Error updating post ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update post" });
  }
};

// Delete a post (DELETE /api/admin/posts/:id)
exports.deletePost = async (req, res) => {
   try {
    const { id } = req.params;
    const container = getPostsContainer();
    const partitionKey = "site#main";

    const { statusCode } = await container.item(id, partitionKey).delete();
    
    if (statusCode === 404) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting post ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete post" });
  }
};

// Handle Local File Upload (POST /api/admin/upload-local)
exports.uploadLocalAsset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // req.file is populated by multer in the router
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(201).json({
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error("Error handling local upload:", error);
    res.status(500).json({ error: "Failed to handle file upload" });
  }
};

// Save metadata for an asset (POST /api/admin/assets)
exports.createAssetMetadata = async (req, res) => {
  try {
    const { postId, blobUrl, contentType, sizeBytes, width, height } = req.body;
    
    if (!postId || !blobUrl) {
      return res.status(400).json({ error: "postId and blobUrl are required" });
    }

    const container = getAssetsContainer();
    const now = new Date().toISOString();
    
    const newAsset = {
      id: `asset-${generateId()}`,
      partitionKey: `post#${postId}`,
      postId,
      blobUrl,
      cdnUrl: null, // Since we don't use a CDN right now
      contentType: contentType || "application/octet-stream",
      sizeBytes: sizeBytes || 0,
      width: width || null,
      height: height || null,
      createdAt: now
    };

    const { resource: createdItem } = await container.items.create(newAsset);
    res.status(201).json(createdItem);
  } catch (error) {
    console.error("Error creating asset metadata:", error);
    res.status(500).json({ error: "Failed to create asset metadata" });
  }
};
