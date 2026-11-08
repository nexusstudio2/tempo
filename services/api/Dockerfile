FROM maven:3.9.16-eclipse-temurin-21-noble AS build
WORKDIR /workspace
COPY services/api/pom.xml services/api/pom.xml
COPY services/api/src services/api/src
COPY database/migrations database/migrations
WORKDIR /workspace/services/api
RUN mvn -B -ntp -DskipTests package

FROM eclipse-temurin:21-jre-noble
RUN useradd --system --uid 10001 --create-home tempo
WORKDIR /app/services/api
COPY --from=build --chown=10001:10001 /workspace/services/api/target/tempo-api-0.1.0-SNAPSHOT.jar /app/tempo-api.jar
COPY --chown=10001:10001 database/migrations /app/database/migrations
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/tempo-api.jar"]
