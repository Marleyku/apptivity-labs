export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "apptivity.online") {
      url.hostname = "www.apptivity.online";
      return Response.redirect(url.toString(), 308);
    }

    return env.ASSETS.fetch(request);
  },
};
