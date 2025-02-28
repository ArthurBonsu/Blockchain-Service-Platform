import { Box, Flex, Icon, Menu, MenuButton, Text, Tooltip } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ComponentType, FC, useEffect, useState } from 'react';

interface MenuItemProps {
  icon?: ComponentType;
  label: string;
  pathname?: string;
  isCollapsed?: boolean;
  shortCutKeys?: string[];
  onClick?: () => void;
}

const MenuItem: FC<MenuItemProps> = ({
  icon,
  label,
  shortCutKeys = [],
  onClick,
  isCollapsed = false,
  pathname = '/',
}) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsBrowser(true);
    }
  }, []);

  if (!isBrowser) return null;

  if (!router) return null;

  const hasShortcutKeys = Boolean(shortCutKeys.length);
  const iconColor = hasShortcutKeys ? 'gray.400' : 'gray.500';
  const textColor = hasShortcutKeys ? 'blackAlpha.400' : 'gray.600';

  const onClickAction = () => {
    if (router && typeof window !== 'undefined') {
      router.push(pathname);
    }
  };

  return (
    <Flex
      p={2}
      w="full"
      borderRadius="md"
      _hover={{ background: 'rgba(0, 0, 0, 0.04)' }}
      {...(isCollapsed && { justifyContent: 'center' })}
    >
      <Menu id={label}>
        <Tooltip
          isDisabled={!isCollapsed}
          label={<Box p={1}>{label}</Box>}
          hasArrow
          placement="right"
          gutter={16}
        >
          <MenuButton onClick={onClick || onClickAction} w="full">
            <Flex
              justifyContent="space-between"
              alignItems="center"
            >
              <Flex
                alignItems="center"
                w="full"
                justifyContent={isCollapsed ? 'center' : 'start'}
              >
                {icon && <Icon color={iconColor} as={icon} />}
                {!isCollapsed && (
                  <Text color={textColor} fontSize={14} ml={hasShortcutKeys ? 2 : 4}>
                    {label}
                  </Text>
                )}
              </Flex>
              {!isCollapsed && hasShortcutKeys && (
                <Text fontSize={10} color="blackAlpha.300" flexShrink={0}>
                  {shortCutKeys.join(' ')}
                </Text>
              )}
            </Flex>
          </MenuButton>
        </Tooltip>
      </Menu>
    </Flex>
  );
};

export default MenuItem;