"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { motion } from "framer-motion";

import { api } from "~/trpc/react";

type Inputs = {
  title: string;
  author: string;
  resume: string;
  qrCode: string;
  currentLibrairyId: number;
};

type FieldNames = keyof Inputs;

const defaultValues = {
  title: "",
  author: "",
  resume: "",
  qrCode: "",
  currentLibrairyId: 17, // 17 = initial state > Book at home
};

const steps = [
  {
    id: "Etape 1",
    name: "Titre",
    fields: ["title"],
  },
  {
    id: "Etape 2",
    name: "Auteur",
    fields: ["author"],
  },
  {
    id: "Etape 3",
    name: "Résumé",
    fields: ["resume"],
  },
  { id: "Etape 5", name: "Validation" },
  { id: "Etape 6", name: "QR Code" },
];

export function CreateBook() {
  const router = useRouter();
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;

  const {
    handleSubmit,
    formState: { errors },
    trigger,
    register,
    reset,
  } = useForm<Inputs>({
    defaultValues,
  });

  const onSubmit: SubmitHandler<Inputs> = ({ currentLibrairyId, ...data }) => {
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
                  <span className="whitespace-nowrap text-sm font-medium text-[#cc66ff] transition-colors ">
                    {step.id}
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium">
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
                  <span className="whitespace-nowrap text-sm font-medium">
                    {step.name}
                  </span>
                </div>
              ) : (
                <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="whitespace-nowrap text-sm font-medium text-gray-500 transition-colors">
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
              placeholder="Titre"
              {...register("title", { required: true })}
              className="w-full rounded-full px-4 py-2 text-black"
            />
            {errors.title && (
              <span className="text-sm font-bold text-[#cc66ff]">
                Renseignez le titre du livre
              </span>
            )}
          </motion.div>
        )}
        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col gap-2"
          >
            <input
              placeholder="Auteur"
              {...register("author", { required: true })}
              className="w-full rounded-full px-4 py-2 text-black"
            />
            {errors.author && (
              <span className="text-sm font-bold text-[#cc66ff]">
                Renseignez l auteur du livre
              </span>
            )}
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col gap-2"
          >
            <textarea
              placeholder="Quel est le sujet de cet ouvrage ?"
              {...register("resume", { required: true })}
              className="w-full rounded-full px-4 py-2 text-black"
            />
            {errors.resume && (
              <span className="text-sm font-bold text-[#cc66ff]">
                Donnez une idée du sujet du livre <br />( les beaux copier
                coller du web sont permis ;)
              </span>
            )}
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div
            initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col gap-2"
          >
            <input hidden {...register("qrCode")} />
            <span>PREVIEW</span>
            <button
              type="submit"
              className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
              disabled={createBook.isLoading}
            >
              {createBook.isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </motion.div>
        )}
        {currentStep === 4 && (
          <>
            <span className="text-center">Lelivre a bien été enregistré !</span>
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
