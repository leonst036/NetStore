// Test Application Local Server
const port = parseInt(Deno.env.get("PORT") || "8000");

export function getTestStatus() {
    return {
        status: "Running",
        message: "Test app is active",
        timestamp: new Date().toISOString()
    };
}

Deno.serve({ port }, () => {
    return new Response(JSON.stringify(getTestStatus()), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
});
