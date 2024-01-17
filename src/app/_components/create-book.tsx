"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { api } from "~/trpc/react";

type Inputs = {
  title: string;
  author: string;
  resume: string;
  cover?: string;
  qrCode: string;
  currentLibrairyId: number;
};

const defaultValues = {
  title: "",
  author: "",
  resume: "",
  cover: "",
  qrCode: "",
  currentLibrairyId: 1,
};

export function CreateBook() {
  const router = useRouter();
  const librairiesList = api.librairy.getAll.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      // initialCursor: 1, // <-- optional you can pass an initialCursor
    },
  );

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
    setValue,
    register,
    reset,
  } = useForm<Inputs>({
    defaultValues,
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setValue("currentLibrairyId", Number(data.currentLibrairyId));
    return createBook.mutate(data);
  };

  console.log(watch("title")); // watch input value by passing the name of it

  const createBook = api.book.create.useMutation({
    onSuccess: () => {
      router.refresh();
      reset();
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <Controller
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            defaultValue={`${field.value}`}
          >
            <SelectTrigger className="w-full rounded-full bg-white px-4 py-2 text-black">
              <SelectValue placeholder="Boite à livre choisie" />
            </SelectTrigger>
            <SelectContent>
              {librairiesList.data?.pages[0]?.items.map((librairy) => (
                <SelectItem key={librairy.id} value={`${librairy.id}`}>
                  {librairy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        control={control}
        name="currentLibrairyId"
        // defaultValue={1}
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
