🌐 Multi-Tier Translation System (DevOps Portfolio)

This project showcases a production-ready translation application deployed using modern DevOps practices. It transitions from local development in Docker to a scalable, orchestrated environment in Kubernetes, managed via Helm and automated through GitHub Actions.

🏗 System Architecture

The application is built on a Microservices architecture:

Frontend: Nginx-based static UI for user interaction.

Backend: Node.js API that orchestrates logic and database persistence.

Database: PostgreSQL for storing translation history with persistent storage.

Translator: A standalone LibreTranslate engine for NLP tasks.

🛠 Tech Stack

Containerization: Docker, Docker Compose

Orchestration: Kubernetes (Minikube/EKS)

Package Management: Helm 3

CI/CD: GitHub Actions

Cloud Infrastructure: AWS ECR (Elastic Container Registry)

Monitoring/Logging: Kubectl & Native K8s Logging

🚀 Deployment Workflow

1. Local Development (Docker Compose)

Ideal for rapid prototyping and local testing.

docker-compose up -d



2. Kubernetes Orchestration

The system is deployed into a Kubernetes cluster with the following features:

Persistence: Using PersistentVolumeClaim (PVC) for PostgreSQL data durability.

Service Discovery: Internal communication via ClusterIP services.

External Access: Ingress Controller configured for translator.local.

Security: Kubernetes Secrets for database credentials.

3. Helm Chart Management

Standardized deployment using Helm.

helm install translation-app ./helm/app-translator



Modify values.yaml to scale replicas or update image tags.

🔄 CI/CD Pipeline (GitHub Actions)

The pipeline is designed with a "Fail Fast" approach. Every commit to main triggers:

Unit Tests: Validating business logic and functions.

Build: Packaging the application into a Docker image.

Integration Tests: Ensuring services (Backend + DB + Translator) communicate correctly.

Security Scan & Push: Authenticating with AWS ECR and pushing the versioned image.

Tagging: Automatic Git tagging based on the commit SHA for traceability.

🧪 Quality Assurance

Unit Tests: Check code integrity before building.

Build Verification: Ensures the Dockerfile is optimized and runnable.

Integration Tests: Critical phase checking the full flow from UI to Database.

Post-Stage (Bonus): Cleanup and notification triggers after deployment.

🔧 Setup & Operations

Environment Requirements

Tools: Docker, Kubectl, Minikube, Helm 3.

Host Configuration:
Add the following to your /etc/hosts file:

$(minikube ip) translator.local



Synchronizing Work (Isolated Branch Workflow)

To move between computers without merging unfinished work into main:

Fetch Remote Metadata:

git fetch origin



Switch to your Work-in-Progress Branch:

# Example for your kubernetes branch
git checkout kubernetes
git pull origin kubernetes



Keep Main Clean: Do NOT run git merge until the feature is fully tested and ready for production deployment.

👨‍💻 Maintainer

Project submitted as part of the DevOps Professional Certification.