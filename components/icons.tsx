import * as React from "react";

import { IconSvgProps } from "@/types";

export const AIIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => (
  <svg
    className="icon"
    height={size || height}
    viewBox="0 0 1024 1024"
    width={size || width}
    {...props}
  >
    <path
      d="M512 5.12c-181.248 0-330.752 150.016-330.752 334.336 0 112.128 44.032 202.752 132.608 263.168v108.032c0 12.288 7.168 24.064 16.384 32.256 8.192 7.68 19.968 11.776 30.72 11.776h4.096l303.104-24.576c22.528-2.048 42.496-20.992 42.496-44.032v-82.944c77.312-55.808 132.096-152.576 132.096-264.192 0-183.808-149.504-333.824-330.752-333.824z m132.096 534.016c-14.336 7.68-21.504 22.528-21.504 38.912V645.12l-220.16 17.408v-84.48c0-15.872-6.656-30.208-19.968-37.888-75.776-44.544-111.616-110.08-111.616-200.704 0-135.68 108.544-245.76 241.664-245.76s242.176 110.592 242.176 245.76c-1.024 88.064-41.472 162.816-110.592 199.68z m62.464 284.672c1.536 24.064-16.384 45.568-40.448 47.104l-301.056 22.016h-3.072c-22.528 0-41.984-17.92-43.52-40.96-1.536-24.064 16.384-45.568 40.448-47.104l301.056-22.016c23.552-1.536 44.544 16.384 46.592 40.96z m-95.744 139.264c2.048 24.064-16.384 45.568-40.448 47.104L461.312 1018.88h-3.584c-22.528 0-41.984-17.408-43.52-40.448-2.048-24.064 16.384-45.568 40.448-47.104l109.056-8.704c24.064-2.048 45.056 15.872 47.104 40.448z m76.8-624.64c-2.048 19.968-18.432 34.816-37.888 34.816h-3.584c-20.992-2.048-36.352-20.992-34.304-41.984 6.144-62.976-49.152-85.504-55.296-88.064-19.968-7.168-30.208-29.184-23.04-49.152 7.168-19.968 28.672-30.208 48.64-23.552 40.448 14.336 115.2 68.096 105.472 167.936z"
      fill="currentColor"
    />
  </svg>
);

export const I18nIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => (
  <svg
    className="icon"
    height={size || height}
    viewBox="0 0 1024 1024"
    width={size || width}
    {...props}
  >
    <path
      d="M399.189333 232.32h228.778667v82.645333h-92.842667c-20.309333 88.32-67.456 165.546667-127.488 230.144 55.125333 53.077333 115.498667 99.968 171.690667 134.4 0 0-31.146667 65.152-36.266667 74.666667-64.341333-38.570667-133.12-91.733333-195.370666-152.021333-84.736 71.808-185.472 124.672-278.869334 155.818666L42.666667 679.552c83.2-27.733333 172.714667-74.666667 247.722666-137.216C228.010667 472.064 174.933333 392.832 150.784 314.965333H55.68V232.32H306.773333l-33.664-67.370667L347.050667 128l52.138666 104.32zM238.506667 314.965333c21.845333 54.229333 61.312 113.066667 111.829333 170.368 46.250667-50.602667 81.408-107.776 99.456-170.368H238.506667z m548.48 181.248h-95.402667l-190.72 413.312h95.36l58.666667-127.146666h168.746666l58.709334 127.146666h95.36l-190.72-413.312z m-47.701334 103.338667l46.208 100.138667h-92.416l46.208-100.138667z"
      fill="currentColor"
    />
  </svg>
);

export const Logo: React.FC<IconSvgProps> = ({
  size = 20,
  height,
  ...props
}) => (
  <svg height={size || height} viewBox="0 0 250 28" {...props}>
    <g transform="translate(0, 26.540000915527344)">
      <path
        d="
        M10.62-10.62L5.31-10.62 5.31 0 0 0 0-23Q0-26.54 3.54-26.54L3.54-26.54 17.69-26.54 17.69-21.23 5.31-21.23 5.31-15.92 12.38-15.92 10.62-10.62ZM21.23-26.54L26.54-26.54 24.77-21.23 21.23-21.23 21.23-26.54ZM21.23 0L26.54 0 26.54-19.46 21.23-19.46 21.23 0ZM33.62 0L33.62 0Q30.08 0 30.08-3.54L30.08-3.54 30.08-26.54 35.38-26.54 35.38-5.31 46-5.31 46-14.15 37.15-14.15 38.92-19.46 47.77-19.46Q51.31-19.46 51.31-15.92L51.31-15.92 51.31-3.54Q51.31 0 47.77 0L47.77 0 33.62 0ZM76.08-15.92L76.08-3.54Q76.08 0 72.54 0L72.54 0 58.38 0Q54.85 0 54.85-3.54L54.85-3.54 54.85-15.92Q54.85-19.46 58.38-19.46L58.38-19.46 72.54-19.46Q76.08-19.46 76.08-15.92L76.08-15.92ZM70.77-14.15L60.15-14.15 60.15-5.31 70.77-5.31 70.77-14.15Z"
        fill="#fcd535"
      />
      <path
        d="
        M90.23-10.62L84.92-10.62 84.92 0 79.62 0 79.62-23Q79.62-26.54 83.15-26.54L83.15-26.54 97.31-26.54 97.31-21.23 84.92-21.23 84.92-15.92 92-15.92 90.23-10.62ZM100.85-26.54L106.15-26.54 104.38-21.23 100.85-21.23 100.85-26.54ZM100.85 0L106.15 0 106.15-19.46 100.85-19.46 100.85 0ZM115 0L109.69 0 109.69-15.92Q109.69-19.46 113.23-19.46L113.23-19.46 127.4-19.46Q130.94-19.46 130.94-15.92L130.94-15.92 130.94 0 125.63 0 125.62-14.15 115-14.15 115 0ZM134.46-3.54L134.46-15.92Q134.46-19.46 138-19.46L138-19.46 152.15-19.46Q155.69-19.46 155.69-15.92L155.69-15.92 155.69 0 150.38 0 150.37-14.15 139.77-14.15 139.77-5.31 148.62-5.31 146.85 0 138.02 0Q134.46 0 134.46-3.54L134.46-3.54ZM164.54 0L159.23 0 159.23-15.92Q159.23-19.46 162.77-19.46L162.77-19.46 176.94-19.46Q180.48-19.46 180.48-15.92L180.48-15.92 180.48 0 175.17 0 175.15-14.15 164.54-14.15 164.54 0ZM201.69-19.46L199.92-14.15 189.31-14.15 189.31-5.31 201.69-5.31 201.69 0 187.54 0Q184 0 184-3.54L184-3.54 184-15.92Q184-19.46 187.54-19.46L187.54-19.46 201.69-19.46ZM222.92-19.46L222.92-19.46Q226.46-19.46 226.46-15.92L226.46-15.92 226.46-10.62Q226.46-7.08 222.92-7.08L222.92-7.08 212.31-7.08 212.31-12.38 221.15-12.38 221.15-14.15 210.54-14.15 210.54-5.31 222.91-5.31 221.17 0 208.77 0Q205.23 0 205.23-3.54L205.23-3.54 205.23-15.92Q205.23-19.46 208.77-19.46L208.77-19.46 222.92-19.46Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

export const GithubIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};
