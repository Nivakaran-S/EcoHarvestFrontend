import React, { useState } from 'react';

// Define interfaces for props
interface StarRatingProps {
  rating?: number;
  onChange: (rating: number) => void;
  hoverStar?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating = 0, onChange, hoverStar }) => {
  const [hover, setHover] = useState<number>(0);

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            className="star-btn"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => {
              if (hoverStar) {
                setHover(starValue);
              }
            }}
            onMouseLeave={() => setHover(0)}
            aria-label={`Rate ${starValue} out of 5 stars`}
          >
            <svg
              className="star"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={starValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
              stroke="#ffc107"
              strokeWidth="1"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;