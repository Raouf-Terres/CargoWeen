# Utilisez une image Python officielle
FROM python:3.9-slim

# Installez les dépendances système
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiez les fichiers nécessaires
COPY requirements.txt .
COPY . .

# Installez les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Exposez le port MLflow
EXPOSE 5000

# Commande de démarrage
CMD ["mlflow", "server", \
     "--host", "0.0.0.0", \
     "--port", "5000", \
     "--backend-store-uri", "sqlite:///mlflow.db", \
     "--default-artifact-root", "./artifacts"]
