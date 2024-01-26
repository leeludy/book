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
  cover?: string | null | undefined;
  qrCode: string;
  currentLibrairyId: number;
  townId: number | null;
};

const defaultValues = {
  title: "",
  author: "",
  resume: "",
  cover: "",
  qrCode: "",
  currentLibrairyId: 1,
  townId: null,
};

export function CreateBook() {
  const router = useRouter();
  const townsList = api.town.getAll.useInfiniteQuery(
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
    register,
    reset,
  } = useForm<Inputs>({
    defaultValues,
  });

  const selectedTownLibrairies = api.librairy.getLibrariesByTown.useQuery({
    townId: Number(watch("townId")),
  });

  const onSubmit: SubmitHandler<Inputs> = ({
    townId,
    currentLibrairyId,
    ...data
  }) => {
    currentLibrairyId = Number(currentLibrairyId);

    console.log("form data", data);

    return createBook.mutate({ currentLibrairyId, ...data });
  };

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
            <SelectTrigger className="w-full  justify-between rounded-full bg-white px-4 py-2 align-middle text-black">
              <SelectValue placeholder="Ville" />
            </SelectTrigger>
            <SelectContent className=" w-full p-1">
              {townsList.data?.pages[0]?.items.map((town) => (
                <SelectItem
                  key={town.id}
                  value={`${town.id}`}
                  className="px-2 py-1"
                >
                  {town.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        control={control}
        name="townId"
      />

      <Controller
        render={({ field }) => (
          <Select
            onValueChange={field.onChange} //(e) => field.onChange(parseInt(e.target.value))
            defaultValue={`${field.value}`}
          >
            <SelectTrigger className="w-full  justify-between rounded-full bg-white px-4 py-2 align-middle text-black">
              <SelectValue placeholder="Boite à livre choisie" />
            </SelectTrigger>
            <SelectContent className=" w-full p-1">
              {selectedTownLibrairies.data?.map((librairy) => (
                <SelectItem
                  key={librairy.id}
                  value={`${librairy.id}`}
                  className="px-2 py-1"
                >
                  {librairy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        control={control}
        name="currentLibrairyId"
        disabled={watch("townId") === null}
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
