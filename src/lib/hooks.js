import { useEffect } from "react";

/**
 * useClickOutside — closes a dropdown/modal when clicking outside the target element.
 * @param {React.RefObject} ref - ref attached to the container element
 * @param {function} handler - callback to invoke when an outside click is detected
 */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    function handleMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        handler(e);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [ref, handler]);
}
