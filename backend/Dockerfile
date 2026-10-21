# Stage 1: Build the Java Spring Boot application with Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Create a lightweight runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080 (standard for Spring Boot)
EXPOSE 8080

# Command to start the application
ENTRYPOINT ["java", "-jar", "app.jar"]