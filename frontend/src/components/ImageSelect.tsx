import { Input } from "./ui/input"
import { Label } from "./ui/label"
 
export function InputFile() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Upload image here</Label>
      <Input className="mt-1 text-black" id="picture" type="file" />
    </div>
  )
}