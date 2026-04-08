package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

var client *firestore.Client

type User struct {
	Name     string `json:"name" firestore:"name"`
	Email    string `json:"email" firestore:"email"`
	Password string `json:"password" firestore:"password"`
}

type Question struct {
	ID            string   `json:"id" firestore:"-"`
	Text          string   `json:"text" firestore:"text"`
	Options       []string `json:"options" firestore:"options"`
	CorrectOption int      `json:"correctOption" firestore:"correctOption"`
	Difficulty    string   `json:"difficulty" firestore:"difficulty"`
}

type QuizResult struct {
	UserID    string `json:"userId" firestore:"userId"`
	Score     int    `json:"score" firestore:"score"`
	Total     int    `json:"total" firestore:"total"`
	Timestamp string `json:"timestamp" firestore:"timestamp"`
}

func initFirebase() {
	ctx := context.Background()
	// NOTE: You must provide your serviceAccountKey.json file in this directory.
	opt := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	client, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalf("error getting Firestore client: %v\n", err)
	}
	fmt.Println("Firebase Firestore initialized successfully!")
}

func signupHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Could not hash password", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword)

	ctx := context.Background()
	// Check if user already exists
	iter := client.Collection("users").Where("email", "==", user.Email).Documents(ctx)
	_, err = iter.Next()
	if err == nil {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	// Save to Firestore
	_, _, err = client.Collection("users").Add(ctx, user)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to add user: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "User created successfully")
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&credentials)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	iter := client.Collection("users").Where("email", "==", credentials.Email).Documents(ctx)
	doc, err := iter.Next()
	if err == iterator.Done {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	var storedUser User
	doc.DataTo(&storedUser)

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(credentials.Password))
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, "Login Success")
}

func getQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	var questions []Question

	iter := client.Collection("questions").Documents(ctx)
	fmt.Println("Fetching questions from Firestore...")
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			http.Error(w, "Error fetching questions", http.StatusInternalServerError)
			return
		}
		var q Question
		doc.DataTo(&q)
		q.ID = doc.Ref.ID
		questions = append(questions, q)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}

func submitResultHandler(w http.ResponseWriter, r *http.Request) {
	var result QuizResult
	err := json.NewDecoder(r.Body).Decode(&result)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	_, _, err = client.Collection("quiz_results").Add(ctx, result)
	if err != nil {
		http.Error(w, "Failed to save quiz result", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "Result submitted successfully")
}

func main() {
	// Initialize Firebase
	// Check if serviceAccountKey.json exists
	if _, err := os.Stat("serviceAccountKey.json"); os.IsNotExist(err) {
		fmt.Println("WARNING: serviceAccountKey.json NOT FOUND.")
		fmt.Println("Please download your Firebase Service Account Key and rename it to 'serviceAccountKey.json'.")
		// We'll proceed so the server can start, but Firestore operations will fail.
	} else {
		initFirebase()
	}

	r := mux.NewRouter()
	r.HandleFunc("/api/auth/signup", signupHandler).Methods("POST")
	r.HandleFunc("/api/auth/login", loginHandler).Methods("POST")
	r.HandleFunc("/api/quiz/questions", getQuestionsHandler).Methods("GET")
	r.HandleFunc("/api/quiz/submit", submitResultHandler).Methods("POST")

	// Apply CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // Adjust in production
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(r)

	port := "8080"
	fmt.Printf("Server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
