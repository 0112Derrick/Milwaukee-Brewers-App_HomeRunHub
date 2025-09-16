import Autoplay from "embla-carousel-autoplay";
import { OptionsType } from "embla-carousel-autoplay/components/Options";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "src/@/components/ui/carousel";
import { CarouselOptions } from "src/interfaces/carousel.types";

export default function ImageCarousel({
  autoPlay,
  images,
  classN,
  opts,
}: {
  autoPlay?: Partial<OptionsType> | undefined;
  images: string[];
  classN?: string;
  opts?: CarouselOptions;
}) {
  return (
    <Carousel
      opts={opts ?? {}}
      plugins={[Autoplay(autoPlay)]}
      className="h-full w-full overflow-hidden"
    >
      <CarouselContent className="h-full">
        {images.map((image, indx) => (
          <CarouselItem
            key={"carousel" + indx}
            className={`${
              classN ?? ""
            } h-full flex items-center justify-center`}
          >
            <img
              src={image}
              className="max-h-full max-w-full object-contain"
              alt=""
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2" />
      <CarouselNext className="right-3 top-1/2 -translate-y-1/2" />
    </Carousel>
  );
}
