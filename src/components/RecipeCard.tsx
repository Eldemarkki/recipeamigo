import styles from "./RecipeCard.module.css";
import { Link } from "./link/Link";
import { EyeOpenIcon, ImageIcon, PersonIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { HiMiniHandThumbUp } from "react-icons/hi2";

export type RecipeCardProps = {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string | undefined | null;
  username?: string | undefined | null;
  viewCount?: number | undefined | null;
  likeCount?: number | undefined | null;
};

export const RecipeCard = ({
  description,
  id,
  name,
  coverImageUrl,
  username,
  viewCount,
  likeCount,
}: RecipeCardProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.coverImageContainer}>
        {coverImageUrl ? (
          <Image
            className={styles.coverImage}
            src={coverImageUrl}
            alt="Recipe placeholder image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <ImageIcon width={100} height={40} />
        )}
      </div>
      <div className={styles.recipeInfoContainer}>
        <div className={styles.recipeTopContainer}>
          <Link href={`/recipe/${id}`} style={{ width: "fit-content" }}>
            <h3>{name}</h3>
          </Link>
          <div className={styles.infoRow}>
            {username && (
              <Link
                href={`/user/${username}`}
                icon={<PersonIcon />}
                className={styles.username}
              >
                {username}
              </Link>
            )}
            {viewCount != undefined && (
              <>
                {username && "\u2022"}
                <div className={styles.viewCount}>
                  <EyeOpenIcon />
                  <span>{viewCount}</span>
                </div>
              </>
            )}
            {likeCount != undefined && (
              <>
                {viewCount != undefined && "\u2022"}
                <div className={styles.likeCount}>
                  <HiMiniHandThumbUp />
                  <span>{likeCount}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <p>{description}</p>
      </div>
    </div>
  );
};
