import Autoplay from "embla-carousel-autoplay";
import { OptionsType } from "embla-carousel-autoplay/components/Options";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
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
    <Carousel opts={{}} plugins={[Autoplay(autoPlay)]}>
      <CarouselContent>
        {images.map((image, indx) => {
          return (
            <CarouselItem key={"carousel" + indx} className={classN}>
              <img src={`${image}`}></img>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2" />
      <CarouselNext className="right-3 top-1/2 -translate-y-1/2" />
    </Carousel>
  );
}
