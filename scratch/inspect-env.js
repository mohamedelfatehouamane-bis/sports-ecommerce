console.log("PROJECT_ID:", process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "Present" : "Missing");
console.log("PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? "Present" : "Missing");
