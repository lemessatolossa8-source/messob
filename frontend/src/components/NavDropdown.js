"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";

// True only on devices with a real mouse/pointer (desktop) — touch devices stay click/tap
const canHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Header nav item with hover-on-desktop / click-on-mobile dropdown.
 * Supports nested submenus (e.g. Floors -> Floor 1, Floor 2, Floor 3, Floor 4).
 */
export default function NavDropdown({
  label,
  items = [],
  pillClassName = "",
  align = "left",
  onNavigate,
}) {
  const [open, setOpen] = useState(false);
  const [activeSub, setActiveSub] = useState(null);
  const ref = useRef(null);
  const closeTimer = useRef(null);

  const openNow = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setActiveSub(null);
    }, 150);
  }, []);

  const handleMouseEnter = () => {
    if (canHover()) openNow();
  };
  const handleMouseLeave = () => {
    if (canHover()) scheduleClose();
  };

  const handleFocus = () => openNow();
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveSub(null);
      ref.current?.querySelector("button")?.blur();
    }
  };

  // Click outside closes — only listen when dropdown is actually open!
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setActiveSub(null);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
    };
  }, [open]);

  const handleItemClick = (e, item) => {
    if (!item?.href) return;

    if (item.href.startsWith("/#") || item.href.startsWith("#")) {
      const anchor = item.href.replace(/^\/?#/, "");
      if (typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname === "")) {
        e.preventDefault();
        const el = document.getElementById(anchor);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          try {
            window.history.pushState(null, "", `#${anchor}`);
          } catch {}
        } else {
          const fallbackSection = document.getElementById("our-services") || document.getElementById("services");
          if (fallbackSection) {
            fallbackSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    } else if (item.href.includes("#")) {
      const [path, hash] = item.href.split("#");
      if (typeof window !== "undefined" && (window.location.pathname === path || window.location.pathname === `${path}/`)) {
        e.preventDefault();
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          try {
            window.history.pushState(null, "", `#${hash}`);
          } catch {}
        }
      }
    }

    setOpen(false);
    setActiveSub(null);
    if (onNavigate) onNavigate();
  };

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={pillClassName}
      >
        <span>{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Main Dropdown Panel */}
      <div
        aria-hidden={!open}
        className={`absolute top-full z-50 pt-2 transition-all duration-200 ease-out ${
          align === "right" ? "right-0" : "left-0"
        } ${
          open
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="w-full min-w-[15rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5">
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const hasChildren = Array.isArray(item.children) && item.children.length > 0;
              const isSubOpen = activeSub === item.name;

              if (hasChildren) {
                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => {
                      if (canHover()) setActiveSub(item.name);
                    }}
                    onMouseLeave={() => {
                      if (canHover()) setActiveSub(null);
                    }}
                  >
                    {/* Item trigger */}
                    <div className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-[#070707] transition hover:bg-slate-100 hover:text-[#D71920] cursor-pointer">
                      <Link
                        href={item.href || "#"}
                        onClick={(e) => handleItemClick(e, item)}
                        className="flex-1 flex items-center gap-2"
                      >
                        <Layers className="h-4 w-4 text-[#D71920]" />
                        <span className="font-semibold">{item.name}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSub((prev) => (prev === item.name ? null : item.name));
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-[#D71920] transition"
                        aria-label={`Toggle ${item.name} submenu`}
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isSubOpen ? "rotate-90 lg:rotate-0 text-[#D71920]" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Submenu for desktop (flyout) and mobile (accordion) */}
                    {isSubOpen && (
                      <>
                        {/* Desktop Flyout */}
                        <div className="hidden lg:block absolute left-full top-0 ml-1.5 z-50 min-w-[14rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
                          <div className="px-3 py-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            {item.name}
                          </div>
                          <div className="flex flex-col gap-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={(e) => handleItemClick(e, child)}
                                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-[#070707] transition hover:bg-rose-50 hover:text-[#D71920]"
                              >
                                <span>{child.name}</span>
                                {child.badge && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-bold">
                                    {child.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Mobile Accordion */}
                        <div className="lg:hidden pl-3 pr-1 py-1.5 mt-0.5 space-y-1 rounded-xl bg-slate-50 border border-slate-100 animate-in fade-in-50">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={(e) => handleItemClick(e, child)}
                              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#070707] transition hover:text-[#D71920]"
                            >
                              <span>{child.name}</span>
                              {child.badge && (
                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-600 font-bold border border-slate-200">
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleItemClick(e, item)}
                  className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-[#070707] transition hover:bg-rose-50/70 hover:text-[#D71920]"
                >
                  <div className="flex items-center gap-2.5">
                    {item.badge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-700 group-hover:bg-[#D71920] group-hover:text-white transition-colors">
                        {item.badge}
                      </span>
                    )}
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#D71920] group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
