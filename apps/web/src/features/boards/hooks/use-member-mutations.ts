import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { inviteMember, removeMember } from "@/features/boards/api/boards";
import { useBoardCache } from "@/features/boards/hooks/use-board-cache";
import {
  removeMember as withoutMember,
  upsertMember,
} from "@/features/boards/lib/board-cache";
import { errorMessage } from "@/lib/error-message";

type Rollback = { rollback: () => void };

/** Inviting comes from a form, which reports a failure itself; removing toasts. */
export function useMemberMutations(boardId: string) {
  const { patch, optimistic } = useBoardCache(boardId);

  const invite = useMutation({
    mutationFn: (email: string) =>
      inviteMember(boardId, { email, role: "member" }),
    onSuccess: (member) => patch((detail) => upsertMember(detail, member)),
  });

  const remove = useMutation<unknown, Error, string, Rollback>({
    mutationFn: (userId) => removeMember(boardId, userId),
    onMutate: async (userId) => ({
      rollback: await optimistic((detail) => withoutMember(detail, userId)),
    }),
    onError: (error, _userId, context) => {
      context?.rollback();
      toast.error(errorMessage(error, "The member could not be removed."));
    },
  });

  return { invite, remove };
}
