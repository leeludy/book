"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { motion } from "framer-motion";

import { api } from "~/trpc/react";

type Inputs = {
  qrCode: string;
  name: string;
  address: string;
  picture: string;
  geographicCoordinates: string;
  townId: number | null;
};

type FieldNames = keyof Inputs;

const defaultValues = {
  qrCode: "",
  name: "",
  address: "",
  picture: "",
  geographicCoordinates: "",
  townId: null,
};

const steps = [
  {
    id: "Etape 1",
    name: "Nom",
    fields: ["name", "picture"],
  },
  {
    id: "Etape 2",
    name: "Ville",
    fields: ["townId"],
  },
  {
    id: "Etape 3",
    name: "Adresse",
    fields: ["address", "geographicCoordinates"],
  },
  { id: "Etape 5", name: "Validation" },
  { id: "Etape 6", name: "QR Code" },
];

export function Createlibrairy() {
  const router = useRouter();
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;

  const townsList = api.town.getAll.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      // initialCursor: 1, // <-- optional you can pass an initialCursor
    },
  );

  const createLibrairy = api.librairy.create.useMutation({
    onSuccess: async () => {
      await next();
      router.refresh();
      reset();
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
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

  const next = async () => {
    const fields = steps[currentStep]?.fields;
    const output = await trigger(fields as FieldNames[], { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };
  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  return (
    <section className="mt-3 flex flex-col justify-between">
      {/* steps */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-4 md:space-y-0">
          {steps.map((step, index) => (
            <li key={step.name} className="md:flex-1">
              {currentStep > index ? (
                <div className="group flex w-full flex-col border-l-4 border-[#cc66ff] py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-[#cc66ff] transition-colors ">
                    {step.id}
                  </span>
                  <span className=" whitespace-nowrap text-sm font-medium">
                    {step.name}
                  </span>
                </div>
              ) : currentStep === index ? (
                <div
                  className="flex w-full flex-col border-l-4 border-[#cc66ff] py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="whitespace-nowrap text-sm font-medium text-[#cc66ff]">
                    {step.id}
                  </span>
                  <span className=" whitespace-nowrap text-sm font-medium">
                    {step.name}
                  </span>
                </div>
              ) : (
                <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className=" whitespace-nowrap text-sm font-medium text-gray-500 transition-colors">
                    {step.id}
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium">
                    {step.name}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-12 flex flex-col">
        {currentStep === 0 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col gap-2"
          >
            <input
              placeholder="Nom"
              {...register("name", { required: true })}
              className="w-full rounded-full px-4 py-2 text-black"
            />
            {errors.name && (
              <span className="text-sm font-bold text-[#cc66ff]">
                Entrez un nom pour la boite à livres
              </span>
            )}
            <Label htmlFor="picture">Voulez vous ajouter une photo ?</Label>
            <input
              id="picture"
              placeholder="Photo"
              {...register("picture")}
              className=" w-full rounded-full px-4 py-2 text-black"
            />
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col gap-2"
          >
            <Controller
              render={({ field }) => (
                <>
                  <Label htmlFor="townId">
                    Dans quelle ville se touve la boite à livre ?
                  </Label>
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
                </>
              )}
              control={control}
              name="townId"
              rules={{ required: true }}
            />
            {errors.townId && (
              <span className="text-sm font-bold text-[#cc66ff]">
                Choisissez une ville{" "}
              </span>
            )}
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className=" flex flex-col gap-5"
          >
            <input
              placeholder="Adresse"
              {...register("address", { required: true })}
              className=" w-full rounded-full px-4 py-2 text-black"
            />
            {errors.address && (
              <span className="text-sm font-bold text-[#cc66ff]">
                Renseignez l adresse de la boite à livres
              </span>
            )}
            <input
              placeholder="Emplacement exact"
              {...register("geographicCoordinates", { required: true })}
              className="mt-2 w-full rounded-full px-4 py-2 text-black"
            />
            {errors.geographicCoordinates && (
              <span className="text-sm font-bold text-[#cc66ff]">
                Renseignez les coordonnées de la boite à livres
              </span>
            )}
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col gap-4"
          >
            <input hidden {...register("qrCode")} />
            <span>PREVIEW</span>
            <button
              type="submit"
              className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
              disabled={createLibrairy.isLoading}
            >
              {createLibrairy.isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </motion.div>
        )}

        {currentStep === 4 && (
          <>
            <span className="text-center">
              La boite à livre à bien été enregistrée !
            </span>
            <span className="text-center">
              Ici joli QR code à télécharger ou à recevoir par mail
            </span>
          </>
        )}
      </form>

      {/* Navigation */}
      <div className="mt-8 pt-5">
        {currentStep < steps.length - 1 && (
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={currentStep === 0}
              className="rounded-full bg-white/10 px-3 py-3 font-semibold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              disabled={currentStep === steps.length - 2}
              className="rounded-full  bg-white/10 px-3 py-3 font-semibold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
