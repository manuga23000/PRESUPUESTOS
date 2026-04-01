import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { text } = await request.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `Sos el sistema de presupuestos de GTM, un taller mecánico argentino. Extraé del texto del usuario la siguiente información y respondé SOLO en JSON válido, sin markdown ni explicación:
{ nombre, vehiculo, total (número sin símbolo ni puntos), items: [{ cantidad, descripcion en mayúsculas, importe vacío }] }
Reglas: ítems son trabajos/materiales. Cantidad puede incluir unidad (LTS, KG). Importe vacío salvo mención explícita. 'mano de obra' o 'mo' = cantidad '1'. Máximo 8 ítems.`,
    messages: [{ role: "user", content: text }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return Response.json({ error: "No text response" }, { status: 500 });
  }

  try {
    const parsed = JSON.parse(content.text);
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "Invalid JSON from AI" }, { status: 500 });
  }
}
