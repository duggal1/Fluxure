"use client";

import { SIDEBAR_LINKS } from "@/constants/links";
import { LogOutIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "../global/container";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/functions";
import { useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";

const DashboardSidebar = () => {
    const { signOut } = useClerk();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredLinks, setFilteredLinks] = useState(SIDEBAR_LINKS);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleLogout = async () => {
        await signOut();
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        // Debounced search with highlighting matches
        const filtered = SIDEBAR_LINKS.filter((link) =>
            link.label.toLowerCase().includes(query)
        );
        setFilteredLinks(filtered);
    };

    // Handle keyboard shortcut
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                document.getElementById("search-input")?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    return (
        <div
            id="sidebar"
            className="top-16 bottom-0 left-0 z-50 fixed lg:flex flex-col hidden bg-background border-r border-border/50 w-72 transform transition-transform duration-500 ease-in-out hover:scale-105"
        >
            <div className={cn("flex flex-col size-full p-3")}>
                <Container delay={0.2} className="h-max">
                    <div className={cn(
                        "relative group transition-all duration-300",
                        isSearchFocused ? "ring-2 ring-primary/50 rounded-lg" : ""
                    )}>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-between px-2 transition-all duration-300",
                                "hover:border-primary/50 hover:shadow-lg",
                                isSearchFocused ? "border-primary" : ""
                            )}
                        >
                            <span className="flex items-center gap-x-1 text-foreground/80">
                                <SearchIcon className={cn(
                                    "size-4 transition-transform duration-300",
                                    isSearchFocused ? "text-primary scale-125" : "group-hover:scale-110"
                                )} />
                                <span className="text-sm">Search...</span>
                            </span>
                            <input
                                id="search-input"
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                placeholder="Search links..."
                                className="bg-transparent focus:placeholder:opacity-50 ml-2 border-none w-full text-foreground/70 text-sm focus:outline-none placeholder:transition-opacity placeholder:duration-300"
                            />
                            <kbd className="group-hover:bg-primary/10 group-hover:text-primary bg-muted px-1.5 py-0.5 rounded-md font-mono text-[10px] text-muted-foreground transition-colors duration-300">
                                ⌘K
                            </kbd>
                        </Button>
                    </div>
                </Container>

                <ul className="space-y-2 py-5 w-full">
                    {filteredLinks.length > 0 ? (
                        filteredLinks.map((link, index) => {
                            const isActive = pathname === link.href;

                            return (
                                <li key={index} className="w-full">
                                    <Container delay={0.1 + index / 10}>
                                        <Link
                                            href={link.href}
                                            className={buttonVariants({
                                                variant: "ghost",
                                                className: cn(
                                                    "w-full !justify-start transition-transform duration-300 hover:scale-105 hover:bg-primary/10",
                                                    isActive
                                                        ? "bg-muted text-primary shadow-lg"
                                                        : "text-foreground/70 hover:text-primary hover:bg-primary/5",
                                                ),
                                            })}
                                        >
                                            <link.icon
                                                strokeWidth={2}
                                                className={cn(
                                                    "size-[18px] mr-1.5 transition-transform duration-300",
                                                    "group-hover:scale-125"
                                                )}
                                            />
                                            {link.label}
                                        </Link>
                                    </Container>
                                </li>
                            );
                        })
                    ) : (
                        <li className="w-full text-center text-foreground/50 animate-pulse">
                            No results found
                        </li>
                    )}
                </ul>

                <div className="flex flex-col gap-3 mt-auto w-full">
                    <Container delay={0.3}>
                        <div className="w-full h-10">
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="justify-start hover:bg-red-500/10 w-full hover:text-red-500 transition-all duration-300"
                            >
                                <LogOutIcon className="group-hover:rotate-12 mr-1.5 transition-transform duration-300 size-4" />
                                Logout
                            </Button>
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default DashboardSidebar;