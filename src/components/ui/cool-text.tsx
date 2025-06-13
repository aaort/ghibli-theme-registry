import React from "react";

function CoolText({ children }: { children: React.ReactNode }) {
	// @ts-expect-error Marquee is deprecated
	return <marquee className="text-secondary">{children}</marquee>;
}

export default CoolText;
