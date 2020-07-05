import { prisma } from "../../../../generated/prisma-client";

export default {
  Query: {
    me: async (_, __, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      console.log(await prisma.user({ id: user.id }))
      return await prisma.user({ id: user.id });
    }
  }
};