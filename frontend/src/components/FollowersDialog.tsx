import { useDispatch } from 'react-redux'
import { DataTableDemo } from './ListOfUsers'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface FollowersDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  users: any[]
}

export function FollowersDialog({ isOpen, onClose, title, users }: FollowersDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-gray-500 border-opacity-40 text-white max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <DataTableDemo info={users} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
