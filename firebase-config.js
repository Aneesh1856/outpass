// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCI1bc0RAMlhn-LKhNrPK19wswZ7Jl87dc",
  authDomain: "outpass-9091d.firebaseapp.com",
  databaseURL: "https://outpass-9091d-default-rtdb.firebaseio.com/",
  projectId: "outpass-9091d",
  storageBucket: "outpass-9091d.firebasestorage.app",
  messagingSenderId: "568328276777",
  appId: "1:568328276777:web:34c80673d5a434868a0538"
};

// Initialize Firebase with error handling
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
  
  // Get references to Firebase services
  const database = firebase.database();
  const auth = firebase.auth();
  
  // Test database connection
  database.ref('.info/connected').on('value', function(snapshot) {
    if (snapshot.val() === true) {
      console.log("Connected to Firebase database");
    } else {
      console.log("Disconnected from Firebase database");
    }
  });
  
  // Export Firebase services for use in other scripts
  window.firebaseDatabase = database;
  window.firebaseAuth = auth;
  
} catch (error) {
  console.error("Firebase initialization error:", error);
  
  // Show error message if in development environment
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    alert("Firebase initialization error. Check console for details.");
  }
}

window.whatsappConfig = {
  provider: 'local',
  apiUrl: 'http://localhost:3001/send-message',
  apiKey: 'your-secret-key-123'
};



