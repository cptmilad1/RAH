import { Link } from 'react-router-dom'

const defaultAvatar = '/imgs/default-avatar.svg'

function UserProfileLink({
  userId,
  name,
  image,
  className = '',
  imageClassName = 'size-9',
  nameClassName = '',
}) {
  const content = (
    <>
      <img
        src={image || defaultAvatar}
        alt=""
        onError={(event) => {
          if (event.currentTarget.src !== new URL(defaultAvatar, window.location.origin).href) {
            event.currentTarget.src = defaultAvatar
          }
        }}
        className={`${imageClassName} shrink-0 rounded-full bg-[#e7efd9] object-cover`}
      />
      {name && <span className={nameClassName}>{name}</span>}
    </>
  )

  if (!userId) {
    return <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>{content}</span>
  }

  return (
    <Link
      to={`/profile/${userId}`}
      className={`inline-flex min-w-0 items-center gap-2 no-underline ${className}`}
      aria-label={`نمایش پروفایل ${name || 'کاربر'}`}
    >
      {content}
    </Link>
  )
}

export default UserProfileLink
