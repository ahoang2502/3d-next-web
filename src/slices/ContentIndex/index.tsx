import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

import Bounded from "@/components/Bounded";
import Heading from "@/components/Heading";

/**
 * Props for `ContentIndex`.
 */
export type ContentIndexProps = SliceComponentProps<Content.ContentIndexSlice>;

/**
 * Component for "ContentIndex" Slices.
 */
const ContentIndex = ({ slice }: ContentIndexProps): JSX.Element => {
	return (
		<Bounded
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<Heading size="lg" className="mb-8">
				{slice.primary.heading}
			</Heading>
		</Bounded>
	);
};

export default ContentIndex;
