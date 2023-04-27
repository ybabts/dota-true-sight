import { Handlers } from "$fresh/server.ts";

function isRequestUpgradable(req: Request) {
  return req.headers.get('Upgrade') === 'websocket';
}

const clients = new Map<string, Set<WebSocket>>();

export const handler: Handlers = {
  async POST(req, ctx) {
    const gsi = await req.json().catch(e => {
      return new Response(e);
    });
    if(!gsi.player) return new Response();
    const accountid = gsi.player.accountid;
    if(!accountid) return new Response();
    if(!clients.has(accountid)) return new Response();
    const sockets = clients.get(accountid)!;
    const raw = JSON.stringify(gsi);
    for(const socket of sockets) {
      socket.send(raw);
    }
    return new Response;
  },
  GET(req, ctx) {
    const url = new URL(req.url);
    const accountid = url.searchParams.get('accountid');
    if(!isRequestUpgradable(req) || typeof accountid !== 'string')
      return new Response(null, { status: 501 });
    const {response, socket} = Deno.upgradeWebSocket(req);
    if(!clients.has(accountid)) clients.set(accountid, new Set);
    const client = clients.get(accountid)!;
    client.add(socket);
    socket.onclose = () => client.delete(socket);
    return response;
  }
};