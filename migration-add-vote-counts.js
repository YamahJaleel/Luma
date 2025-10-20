// One-time migration script to add vote counts to existing profiles
// Run this once after deploying the voting system

import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './config/firebase';

const migrateExistingProfiles = async () => {
  try {
    console.log('🔄 Starting migration to add vote counts...');
    
    const profilesSnapshot = await getDocs(collection(db, 'profiles'));
    const profilesToUpdate = [];
    
    profilesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Only update profiles that don't have vote counts
      if (data.positiveVoteCount === undefined || data.negativeVoteCount === undefined) {
        profilesToUpdate.push({
          id: doc.id,
          data: data
        });
      }
    });
    
    console.log(`📊 Found ${profilesToUpdate.length} profiles to update`);
    
    // Update profiles in batches
    for (const profile of profilesToUpdate) {
      await updateDoc(doc(db, 'profiles', profile.id), {
        positiveVoteCount: 0,
        negativeVoteCount: 0
      });
      console.log(`✅ Updated profile: ${profile.data.name || profile.id}`);
    }
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

// Uncomment the line below to run the migration
// migrateExistingProfiles();

export default migrateExistingProfiles;
