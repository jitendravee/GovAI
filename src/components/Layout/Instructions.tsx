import { Stack, Heading, Icon, Button, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { FiAlertTriangle, FiSun, FiZap } from "react-icons/fi";

type Introdution = {
    icon: IconType,
    name: "Examples" | "Capabilities" | "Limitations",
    list: string[]
};

export interface IInstructionsProps {
    onClick: (text: string) => void
};

export const Instructions = ({ onClick }: IInstructionsProps) => {
    const introdution: Introdution[] = [
        {
            icon: FiSun,
            name: "Examples",
            list: [
                "What documents do I need to apply for a passport?",
                "Help me create a rental agreement from scratch",
                "How can I draft a missing affidavit using AI?"
            ]
        },
        {
            icon: FiZap,
            name: "Capabilities",
            list: [
                "Suggests required documents based on your needs",
                "Generates documents using AI templates",
                "Guides you in creating missing documents step by step"
            ]
        },
        {
            icon: FiAlertTriangle,
            name: "Limitations",
            list: [
                "AI-generated documents may need legal validation",
                "Some documents may require manual signatures or notarization",
                "Responses are for assistance and may not replace professional advice"
            ]
        }
        
    ];

    return (
        <Stack
            justifyContent="center"
            alignItems="center"
            height="full"
            overflow="auto"
        >
            <Heading
                size="lg"
                marginY={8}
            >GovAI</Heading>
            <Stack
                direction={["column", "column", "row"]}
            >
                {introdution.map(({ icon, list, name }, key) => {
                    const handleClick = (text: string) => {
                        if (name == 'Examples') {
                            return () => onClick(text);
                        };
                        return undefined;
                    };

                    return (
                        <Stack
                            key={key}
                            alignItems="center"
                        >
                            <Icon
                                as={icon}
                            />
                            <Heading size="sm">{name}</Heading>
                            {list.map((text, key) => (
                                <Button
                                    key={key}
                                    maxWidth={64}
                                    height="fit-content"
                                    padding={4}
                                    onClick={handleClick(text)}
                                >
                                    <Text
                                        overflow="hidden"
                                        whiteSpace="normal"
                                    >{text}</Text>
                                </Button>
                            ))}
                        </Stack>
                    )
                })}
            </Stack>
        </Stack>
    );
};