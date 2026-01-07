import fs from "fs";
import fetch from "node-fetch";

const ENDPOINT = "https://rickandmortyapi.com/graphql"; // <-- replace with your endpoint

// Read all files in the current directory
const files = fs.readdirSync(process.cwd());

// Filter only character-page-*.graphql files
const graphqlFiles = files.filter(f => /^episode-page-\d+\.graphql$/.test(f));

if (graphqlFiles.length === 0) {
  console.error("No character-page-*.graphql files found.");
  process.exit(1);
}

for (const file of graphqlFiles) {
  // Extract ID from filename: character-page-1.graphql → 1
  const match = file.match(/^episode-page-(\d+)\.graphql$/);
  if (!match) continue;

  const id = match[1];
  const outputFile = `episode-page-${id}-output.json`;

  // Read GraphQL query
  const query = fs.readFileSync(file, "utf8");

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { id }
      })
    });

    const result = await response.json();

    // Write output JSON
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

    console.log(`Processed ${file} → ${outputFile} (id=${id})`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}
