
import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/" className='text-blue-600 hover:underline'>Return Home</Link>
    </div>
  )
}