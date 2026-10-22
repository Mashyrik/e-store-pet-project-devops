# syntax=docker/dockerfile:1
FROM maven:3.9.11-eclipse-temurin-21 AS build

WORKDIR /build

COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B --no-transfer-progress dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B --no-transfer-progress package -DskipITs

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build --chown=10001:10001 /build/target/e-store-*.jar app.jar

EXPOSE 8080

USER 10001:10001

ENTRYPOINT ["java", "-jar", "app.jar"]
