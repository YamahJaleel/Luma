import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizeForSearch } from '../utils/normalization';

const COLLECTIONS = {
  POSTS: 'posts',
  LIKES: 'likes',
  COMMENTS: 'comments',
  CATEGORIES: 'categories'
};

export const postService = {
  // Create a new post
  createPost: async (postData, userId) => {
    try {
      // Ensure required fields are present
      if (!postData.title || !postData.text || !postData.category || !userId) {
        throw new Error('Missing required fields for post creation');
      }

      const post = {
        title: postData.title,
        text: postData.text,
        category: postData.category,
        authorId: userId,
        authorName: postData.authorName || 'Anonymous',
        type: postData.type || 'general',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        views: 0,
        isDeleted: false
      };

      console.log('📝 Creating new post:', post);
      const docRef = await addDoc(collection(db, COLLECTIONS.POSTS), post);
      console.log('✅ Post created successfully with ID:', docRef.id);
      
      // Get the actual document with server timestamp
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Post was not created properly');
      }
      
      const data = docSnap.data();
      return {
        id: docRef.id,
        ...data,
        createdAt: data.createdAt?.toDate()
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Get all posts
  getPosts: async (category = null, sortBy = 'recent', limitCount = 50) => {
    try {
      // Start with collection reference
      const postsRef = collection(db, COLLECTIONS.POSTS);
      
      // Build query constraints
      const constraints = [];
      
      // Add filters
      constraints.push(where('isDeleted', '==', false));
      if (category && category !== 'all') {
        constraints.push(where('category', '==', category));
      }
      
      // Add sorting
      switch (sortBy) {
        case 'recent':
          constraints.push(orderBy('createdAt', 'desc'));
          break;
        case 'top':
          constraints.push(orderBy('likes', 'desc'));
          break;
        case 'trending':
          constraints.push(orderBy('views', 'desc'));
          break;
        case 'comments':
          constraints.push(orderBy('comments', 'desc'));
          break;
        default:
          constraints.push(orderBy('createdAt', 'desc'));
      }

      // Add limit
      constraints.push(limit(limitCount));

      // Create query with all constraints
      const q = query(postsRef, ...constraints);
      console.log('🔍 Fetching posts with category:', category, 'sort:', sortBy);
      const querySnapshot = await getDocs(q);
      
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      console.log(`✅ Retrieved ${posts.length} posts`);
      return posts;
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  },

  // Get a single post
  getPost: async (postId) => {
    try {
      const docRef = doc(db, COLLECTIONS.POSTS, postId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Increment view count
        await updateDoc(docRef, {
          views: increment(1)
        });
        
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  },

  // Update a post
  updatePost: async (postId, updateData) => {
    try {
      const docRef = doc(db, COLLECTIONS.POSTS, postId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete a post (soft delete)
  deletePost: async (postId) => {
    try {
      const docRef = doc(db, COLLECTIONS.POSTS, postId);
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Like a post
  likePost: async (postId, userId) => {
    try {
      const postRef = doc(db, COLLECTIONS.POSTS, postId);
      const likeRef = doc(db, COLLECTIONS.LIKES, `${postId}_${userId}`);

      const likeDoc = await getDoc(likeRef);
      
      if (!likeDoc.exists()) {
        console.log('👍 Adding like to post:', postId, 'by user:', userId);
        
        // Create like document
        await addDoc(collection(db, COLLECTIONS.LIKES), {
          postId,
          userId,
          createdAt: serverTimestamp()
        });
        
        // Increment post likes
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(userId)
        });
        
        console.log('✅ Like added successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  // Unlike a post
  unlikePost: async (postId, userId) => {
    try {
      const postRef = doc(db, COLLECTIONS.POSTS, postId);
      const likeRef = doc(db, COLLECTIONS.LIKES, `${postId}_${userId}`);

      const likeDoc = await getDoc(likeRef);
      
      if (likeDoc.exists()) {
        // Delete like document
        await deleteDoc(likeRef);
        
        // Decrement post likes
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userId)
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  },

  // Get user's liked posts
  getLikedPosts: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.LIKES),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const likedPostIds = querySnapshot.docs.map(doc => doc.data().postId);
      
      // Get the actual posts
      const posts = await Promise.all(
        likedPostIds.map(postId => getDoc(doc(db, COLLECTIONS.POSTS, postId)))
      );
      
      return posts
        .filter(doc => doc.exists())
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
    } catch (error) {
      console.error('Error getting liked posts:', error);
      throw error;
    }
  },

  // Get posts by user
  getUserPosts: async (userId) => {
    try {
      const q = query(
        collection(db, COLLECTIONS.POSTS),
        where('authorId', '==', userId),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
    } catch (error) {
      console.error('Error getting user posts:', error);
      throw error;
    }
  },

  // Search posts
  searchPosts: async (searchQuery) => {
    try {
      // Note: For proper text search, you might want to use Algolia or a similar service
      // This is a basic implementation that searches titles only
      const q = query(
        collection(db, COLLECTIONS.POSTS),
        where('isDeleted', '==', false),
        orderBy('title'),
        // where('title', '>=', searchQuery),
        // where('title', '<=', searchQuery + '\uf8ff'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }))
        .filter(post => 
        normalizeForSearch(post.title).includes(normalizeForSearch(searchQuery)) ||
        normalizeForSearch(post.text).includes(normalizeForSearch(searchQuery))
        );
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }
};

export default postService;
