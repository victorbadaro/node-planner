import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { ClientError } from "../errors/client-error";
import { prisma } from "../lib/prisma";

export async function confirmAndUpdateParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch('/participants/:participantId/confirm', {
    schema: {
      params: z.object({
        participantId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        email: z.string().email()
      })
    },
  }, async (request, reply) => {
    const { participantId } = request.params;
    const { name, email } = request.body;
    const participant = await prisma.participant.findUnique({
      where: { id: participantId }
    });

    if(!participant) {
      throw new ClientError('Participant not found.');
    }

    await prisma.participant.update({
      where: { id: participantId },
      data: {
        is_confirmed: true,
        name,
        email
      }
    });

    return reply.status(204).send();
  });
}