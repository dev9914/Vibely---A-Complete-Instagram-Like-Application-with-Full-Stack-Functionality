import { CardWithForm } from '../components/Card'

const CreatePost = () => {
  return (
    <div className="">
                                  <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width:'100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
            zIndex: 100,
          }} className='flex justify-center items-center'>
            <CardWithForm />
          </div>
    </div>
  )
}

export default CreatePost
