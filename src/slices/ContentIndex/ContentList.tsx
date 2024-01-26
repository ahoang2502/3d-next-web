"use client";

import { Content, asImageSrc, isFilled } from "@prismicio/client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { MdArrowOutward } from "react-icons/md";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ContentListProps = {
	items: Content.BlogPostDocument[] | Content.ProjectDocument[];
	contentType: Content.ContentIndexSlice["primary"]["content_type"];
	fallbackItemImage: Content.ContentIndexSlice["primary"]["fallback_item_image"];
	viewMoreText: Content.ContentIndexSlice["primary"]["view_more_text"];
};

export const ContentList = ({
	viewMoreText = "Read more",
	items,
	contentType,
	fallbackItemImage,
}: ContentListProps) => {
	const [currentItem, setCurrentItem] = useState<null | number>(null);

	const componentRef = useRef(null);
	const revealRef = useRef(null);
	const itemsRef = useRef<Array<HTMLLIElement | null>>([]);
	const lastMousePosRef = useRef({ x: 0, y: 0 });

	const urlPrefix = contentType === "Blog" ? "/blog" : "/projects";

	const contentImages = items.map((item) => {
		const image = isFilled.image(item.data.hover_image)
			? item.data.hover_image
			: fallbackItemImage;

		return asImageSrc(image, {
			fit: "crop",
			w: 220,
			h: 320,
			exp: -10,
		});
	});

	useEffect(() => {
		let ctx = gsap.context(() => {
			itemsRef.current.forEach((item) => {
				gsap.fromTo(
					item,
					{
						opacity: 0,
						y: 20,
					},
					{
						opacity: 1,
						y: 0,
						duration: 1.3,
						ease: "elastic.out(1,0.3)",
						scrollTrigger: {
							trigger: item,
							start: "top bottom-=100px",
							end: "bottom center",
							toggleActions: "play none none none",
						},
					}
				);
			});

			return () => ctx.revert();
		}, componentRef);
	}, []);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const mousePos = { x: e.clientX, y: e.clientY + window.scrollY };

			// Calculate speed & direction
			const speed = Math.sqrt(
				Math.pow(mousePos.x - lastMousePosRef.current.x, 2)
			);

			let ctx = gsap.context(() => {
				if (currentItem !== null) {
					const maxY = window.scrollY + window.innerHeight - 350;
					const maxX = window.innerWidth - 250;

					gsap.to(revealRef.current, {
						x: gsap.utils.clamp(0, maxX, mousePos.x - 110),
						y: gsap.utils.clamp(0, maxY, mousePos.y - 160),
						rotation: speed * (mousePos.x > lastMousePosRef.current.x ? 1 : -1),
						ease: "back.out(2)",
						duration: 1.3,
						opacity: 1,
					});
				}

				lastMousePosRef.current = mousePos;
				return () => ctx.invert();
			}, componentRef);
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [currentItem]);

	useEffect(() => {
		contentImages.forEach((url) => {
			if (!url) return;

			const img = new Image();
			img.src = url;
		});
	}, [contentImages]);

	const onMouseEnter = (index: number) => {
		setCurrentItem(index);
	};

	const onMouseLeave = () => {
		setCurrentItem(null);
	};

	return (
		<div ref={componentRef}>
			<ul
				className="grid border-b border-b-slate-100 "
				onMouseLeave={onMouseLeave}
			>
				{items.map((item, index) => (
					<div key={index}>
						{isFilled.keyText(item.data.title) && (
							<li
								className="list-item opacity-0 "
								onMouseEnter={() => onMouseEnter(index)}
								ref={(element) => (itemsRef.current[index] = element)}
							>
								<Link
									href={urlPrefix + "/" + item.uid}
									className="flex flex-col justify-between border-t border-t-slate-100 py-10 text-slate-200 md:flex-row "
									aria-label={item.data.title}
								>
									<div className="flex flex-col">
										<span className="text-3xl font-bold">
											{" "}
											{item.data.title}
										</span>

										<div className="flex gap-3 text-pink-500 text-lg font-bold">
											{item.tags.map((tag, index) => (
												<span key={index}>{tag}</span>
											))}
										</div>
									</div>

									<span className="ml-auto flex items-center gap-2 text-xl font-medium md:ml-0">
										{viewMoreText} <MdArrowOutward className="" />
									</span>
								</Link>
							</li>
						)}
					</div>
				))}
			</ul>

			{/* Hover Element */}
			<div
				className="hover-reveal pointer-events-none absolute left-0 top-0 -z-10 h-[320px] w-[220px] rounded-lg bg-cover bg-center opacity-0 transition-[background] duration-300"
				style={{
					backgroundImage:
						currentItem !== null ? `url(${contentImages[currentItem]})` : "",
				}}
				ref={revealRef}
			></div>
		</div>
	);
};
