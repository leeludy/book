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
  qrCode: string;
  name: string;
  address: string;
  picture: string;
  geographicCoordinates: string;
  townId: number | null;
};

const defaultValues = {
  qrCode: "",
  name: "",
  address: "",
  picture: "",
  geographicCoordinates: "",
  townId: null,
};

export function Createlibrairy() {
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
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<Inputs>({
    defaultValues,
  });

  const onSubmit: SubmitHandler<Inputs> = ({ townId, ...data }) => {
    townId = Number(townId);

    console.log("form data", data);

    return createLibrairy.mutate({ townId, ...data });
  };

  const createLibrairy = api.librairy.create.useMutation({
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

      <input
        placeholder="Nom"
        {...register("name", { required: true })}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      {errors.name && <span>Renseignez le nom de la boite à livres</span>}
      <input
        placeholder="Adresse"
        {...register("address", { required: true })}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      {errors.address && <span>Renseignez l adresse de la boite à livres</span>}
      <input
        placeholder="Emplacement exact"
        {...register("geographicCoordinates", { required: true })}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      {errors.geographicCoordinates && (
        <span>Renseignez les coordonnées de la boite à livres</span>
      )}
      <input
        placeholder="Photo"
        {...register("picture")}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <input hidden {...register("qrCode")} />

      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createLibrairy.isLoading}
      >
        {createLibrairy.isLoading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
