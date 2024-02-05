import { createStrictContext } from "@/lib/create-strict-context"
import clsx from "clsx"
import { motion } from "framer-motion"
import {
  Children,
  cloneElement,
  isValidElement,
  useRef,
  type PropsWithChildren,
  type ReactElement,
  useEffect,
} from "react"
import * as R from "remeda"

type StepperContext = {
  active: number
  onStepClick: (index: number) => void
}

const [StepperProvider, useStepperContext] = createStrictContext<StepperContext>({
  name: "Stepper",
})

type StepProps = {
  index?: number
  title: string
  description?: string
}

function Step({ children, index }: PropsWithChildren<StepProps>) {
  const { active } = useStepperContext()
  const previousActive = useRef(active)

  useEffect(() => {
    previousActive.current = active
  }, [active])

  const delta = active - previousActive.current

  if (index !== active) {
    return
  }

  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className=" flex flex-col gap-5"
    >
      {children}
    </motion.div>
  )
}

function StepCompleted({ children }: PropsWithChildren) {
  return <>{children}</>
}

export function Stepper({ children, ...props }: PropsWithChildren<StepperContext>) {
  const validElements = Children.toArray(children)
    .filter(isValidElement)
    .filter((v) => v.type === Step || v.type === StepCompleted) as ReactElement[]

  const [steps, stepCompleted] = R.partition(validElements, (v) => v.type === Step)
  const items = steps.map((step, index) => cloneElement(step, { index }))

  return (
    <StepperProvider value={props}>
      {/* Progress header with ticks */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-4 md:space-y-0">
          {steps.map((item, index) => (
            <div
              key={item.key}
              className={clsx(
                "flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                props.active > index && "group border-[#cc66ff] transition-colors",
                props.active === index && "border-[#cc66ff]",
                props.active < index && "group border-gray-200 transition-colors",
              )}
            >
              <span
                className={clsx(
                  "whitespace-nowrap text-sm font-medium",
                  props.active > index && "text-[#cc66ff] transition-colors",
                  props.active === index && "text-[#cc66ff]",
                  props.active < index && "text-gray-500 transition-colors",
                )}
              >
                {(item.props as ReactElement<StepProps>["props"]).title}
              </span>
              <span className="whitespace-nowrap text-sm font-medium">
                {(item.props as ReactElement<StepProps>["props"]).description}
              </span>
            </div>
          ))}
        </ol>
      </nav>
      {/* Definition of our steps */}
      {items}
      {props.active === steps.length && stepCompleted}
    </StepperProvider>
  )
}

Stepper.Step = Step
Stepper.StepCompleted = StepCompleted
