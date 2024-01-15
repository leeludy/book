"use client";

import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";

import { api } from "~/trpc/react";

type Inputs = {
  title: string;
  author: string;
  resume: string;
  cover: string;
  qrCode: string;
  currentLibrairyId: number;
};

export function CreateBook() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => createBook.mutate(data);

  console.log(watch("title")); // watch input value by passing the name of it

  const createBook = api.book.create.useMutation({
    onSuccess: () => {
      router.refresh();
      reset();
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <input
        placeholder="Boite à livre de dépot"
        {...register("currentLibrairyId", { required: true })}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <input
        placeholder="Titre"
        {...register("title", { required: true })}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      {errors.title && <span>Renseignez le titre du livre</span>}
      <input
        placeholder="Auteur"
        {...register("author", { required: true })}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      {errors.author && <span>Renseignez l auteur du livre</span>}
      <textarea
        placeholder="Quel est le sujet de cet ouvrage ?"
        {...register("resume", { required: true })}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <input
        placeholder="Couverture"
        {...register("cover")}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <input hidden {...register("qrCode")} />

      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createBook.isLoading}
      >
        {createBook.isLoading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
