"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import { api } from "~/trpc/react"
import { LeftArrowButton, RightArrowButton } from "./navigation"
import { Stepper } from "./stepper"

type Inputs = {
  qrCode: string
  name: string
  address: string
  picture: string
  geographicCoordinates: string
  townId: number | null
}

type FieldNames = keyof Inputs

const defaultValues = {
  qrCode: "",
  name: "",
  address: "",
  picture: "",
  geographicCoordinates: "",
  townId: null,
}

const steps = [["name", "picture"], ["townId"], ["address", "geographicCoordinates"]]

export function CreateLibrary() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const [open, setOpen] = useState(false)

  const townsList = api.town.getAll.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      // initialCursor: 1, // <-- optional you can pass an initialCursor
    },
  )

  const createLibrary = api.library.create.useMutation({
    onSuccess: async () => {
      await next()
      router.refresh()
    },
  })

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitted, isSubmitSuccessful },
    trigger,
    register,
  } = useForm<Inputs>({
    defaultValues,
  })

  const onSubmit: SubmitHandler<Inputs> = ({ townId, ...data }) => {
    townId = Number(townId)

    console.log("form data", data)

    return createLibrary.mutate({ townId, ...data })
  }

  const next = async () => {
    const fields = steps[currentStep]
    const isFormValid = await trigger(fields as FieldNames[], { shouldFocus: true })

    if (!isFormValid) return

    setCurrentStep((step) => step + 1)
  }

  return (
    <section className="mt-3 flex flex-col justify-between">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-12 flex flex-col">
        <Stepper active={currentStep} onStepClick={(index) => setCurrentStep(index)}>
          <Stepper.Step title="Etape 1" description="Nom">
            <div className="mt-4 flex flex-col gap-2">
              <input
                placeholder="Nom"
                {...register("name", { required: true })}
                className=" w-full rounded-full px-4 py-2 text-black"
              />
              {errors.name && (
                <span className="text-sm font-bold text-[#cc66ff]">
                  Entrez un nom pour la boite à livres
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Label htmlFor="picture">Voulez vous ajouter une photo ?</Label>
              <input
                id="picture"
                placeholder="Photo"
                {...register("picture")}
                className="  w-full rounded-full px-4 py-2 text-black"
              />
            </div>
          </Stepper.Step>

          <Stepper.Step title="Etape 2" description="Ville">
            <Controller
              control={control}
              name="townId"
              rules={{ required: true }}
              render={({ field }) => (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "mt-4 flex w-full justify-between rounded-full pl-5 text-base text-black",
                        !field.value && "text-neutral-400 ",
                      )}
                    >
                      {field.value
                        ? townsList.data?.pages[0]?.items.find((town) => town.id === field.value)
                            ?.name
                        : "Choisissez une ville"}
                      <CaretSortIcon className="ml-2 h-5 w-5  text-black" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-2">
                    <Command>
                      <CommandInput placeholder="Ville" className="ml-2 h-9 px-1" />
                      <CommandEmpty className="h-7 p-2 text-base">
                        Aucune ville correspondante
                      </CommandEmpty>
                      <CommandGroup>
                        {townsList.data?.pages[0]?.items.map((town) => (
                          <CommandItem
                            value={town.name}
                            key={town.id}
                            onSelect={() => {
                              setValue("townId", town.id), setOpen(false)
                            }}
                            className="h-7 text-base"
                          >
                            {town.name.replace(/^./, town.name.charAt(0).toUpperCase())}
                            <CheckIcon
                              className={cn(
                                "ml-auto h-4 w-4",
                                town.id === field.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.townId && (
              <span className="text-sm font-bold text-[#cc66ff]">Choisissez une ville</span>
            )}
          </Stepper.Step>

          <Stepper.Step title="Etape 3" description="Adresse">
            <div className="mt-4 flex flex-col gap-2">
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
            </div>
            <div className="mt-4 flex flex-col gap-2">
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
            </div>
          </Stepper.Step>

          <Stepper.Step title="Etape 4" description="Validation">
            <input hidden {...register("qrCode")} />
            <span>PREVIEW</span>
            <button
              type="submit"
              className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
              disabled={createLibrary.isLoading}
            >
              {createLibrary.isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </Stepper.Step>

          <Stepper.StepCompleted>
            <span className="text-center">La boite a livre à bien été enregistrée !</span>
            <span className="text-center">
              Ici joli QR code à télécharger ou à recevoir par mail
            </span>
          </Stepper.StepCompleted>
        </Stepper>
      </form>

      {!(isSubmitSuccessful || isSubmitted) && (
        <div className="mt-8 pt-5">
          <div className="flex justify-between">
            <LeftArrowButton
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((step) => step - 1)}
            />
            <RightArrowButton disabled={currentStep === 3} onClick={next} />
          </div>
        </div>
      )}
    </section>
  )
}
