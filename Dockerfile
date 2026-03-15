FROM maven:3.9.6-eclipse-temurin-21-jammy AS builder
WORKDIR /app
COPY backend/pom.xml .
# Download dependencies first to cache them
RUN mvn dependency:go-offline -B

COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
