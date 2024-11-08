import { Checkbox } from "./ui/checkbox"
 
export function CheckboxDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" className="h-4 w-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500" />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Remember Me
      </label>
    </div>
  )
}