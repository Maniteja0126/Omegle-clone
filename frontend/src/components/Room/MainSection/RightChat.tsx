export const RightChat = ({ name, message, time, status }: any) => {
    return (
      <div className='flex items-start gap-2.5'>
        <div className='flex flex-col gap-1 w-full max-w-[320px]'>
          <div className='flex items-center justify-end space-x-2'>
            <span className='text-sm font-normal text-gray-500'>{time}</span>
            <span className='text-sm font-semibold text-gray-900'>
              {name}
            </span>
          </div>
          <div className='flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-s-xl rounded-ee-xl'>
            <p className='text-sm font-normal text-gray-900'>{message}</p>
          </div>
          <span className='text-sm font-normal text-gray-500'>{status}</span>
        </div>
        <div className='w-9 h-7 rounded-full flex justify-center items-center bg-gray-200'>
          <span>{name.split('')[0].toUpperCase()}</span>
        </div>
      </div>
    );
  };
  
   