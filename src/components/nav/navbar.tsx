'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Financial Tracking', href: '/financial-tracking' },
  { name: 'Voting Records', href: '/voting-records' },
  { name: 'Education', href: '/education' },
  { name: 'Take Action', href: '/action' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Conflicting Interests
            </Link>
            <NavigationMenu className="hidden ml-6 sm:flex">
              <NavigationMenuList>
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <NavigationMenuItem key={item.name}>
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()} active={isActive}>
                          {item.name}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline">Sign In</Button>
            <Button>Report Conflict</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
