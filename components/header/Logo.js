import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
        <Image 
          src="/images/logo.svg" 
          alt="Best Garden Hotel" 
          width={100} 
          height={100} 
          className="rounded-full"
        />
      </div>
    </Link>
  );
};

export default Logo;