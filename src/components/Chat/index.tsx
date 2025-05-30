//Modules
import gptAvatar from "@/assets/gpt-avatar.svg";
import warning from "@/assets/warning.svg";
import user from "@/assets/user.png";
import { useRef } from "react";
import { useChat } from "@/store/chat";
import { useForm } from "react-hook-form";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { OpenAIApi, Configuration } from "openai";
import { useMutation } from "react-query";

//Components
import { Input } from "@/components/Input";
import { FiSend } from "react-icons/fi";
import { Avatar, IconButton, Spinner, Stack, Text } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { Instructions } from "../Layout/Instructions";
import { useAPI } from "@/store/api";

export interface ChatProps {}

interface ChatSchema {
  input: string;
}

export const Chat = ({ ...props }: ChatProps) => {
  const { api } = useAPI();
  const { selectedChat, addMessage, addChat, editChat } = useChat();
  const selectedId = selectedChat?.id,
    selectedRole = selectedChat?.role;

  const hasSelectedChat = selectedChat && selectedChat?.content.length > 0;

  const { register, setValue, handleSubmit } = useForm<ChatSchema>();

  const overflowRef = useRef<HTMLDivElement>(null);
  const updateScroll = () => {
    overflowRef.current?.scrollTo(0, overflowRef.current.scrollHeight);
  };

  const [parentRef] = useAutoAnimate();

  const configuration = new Configuration({
    apiKey: api,
  });

  const openAi = new OpenAIApi(configuration);

  const { mutate, isLoading } = useMutation({
    mutationKey: "prompt",
    mutationFn: async (prompt: string) => {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer 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`, // from useAPI()
            "HTTP-Referer": "yourapp.com", // Replace with your domain
            "X-Title": "IndianGovtAI", // Optional custom label
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo", // You can also use other available models
            max_tokens: 2000,
            messages: [
              {
                role: "system",
                content: `
      You are an Indian Government AI assistant. Your job is to help users create official government documents like OBC certificates, caste certificates, income certificates, etc.
      
      You must ask follow-up questions to ensure all requirements are fulfilled. If something is missing, suggest valid alternatives. If there are no alternatives, politely tell the user what document they need to get first and how to get it.
      
      Be helpful, polite, and thorough.
      `,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Something went wrong");
      }

      const data = await response.json();
      return data;
    },
  });

  const handleAsk = async ({ input: prompt }: ChatSchema) => {
    updateScroll();
    const sendRequest = (selectedId: string) => {
      setValue("input", "");

      addMessage(selectedId, {
        emitter: "user",
        message: prompt,
      });

      mutate(prompt, {
        onSuccess(data, variable) {
          const message = String(data.choices[0].message?.content);
          addMessage(selectedId, {
            emitter: "gpt",
            message,
          });

          if (selectedRole == "New chat" || selectedRole == undefined) {
            editChat(selectedId, { role: variable });
          }

          updateScroll();
        },
        onError(error) {
          type Error = {
            response: {
              data: {
                error: {
                  code: "invalid_api_key" | string;
                  message: string;
                };
              };
            };
          };

          const { response } = error as Error,
            message = response.data.error.message;
          addMessage(selectedId, {
            emitter: "error",
            message,
          });
          updateScroll();
        },
      });
    };

    if (selectedId) {
      if (prompt && !isLoading) {
        sendRequest(selectedId);
      }
    } else {
      addChat(sendRequest);
    }
  };

  return (
    <Stack width="full" height="full">
      <Stack
        maxWidth="768px"
        width="full"
        marginX="auto"
        height="85%"
        overflow="auto"
        ref={overflowRef}
      >
        <Stack spacing={2} padding={2} ref={parentRef} height="full">
          {hasSelectedChat ? (
            selectedChat.content.map(({ emitter, message }, key) => {
              const getAvatar = () => {
                switch (emitter) {
                  case "gpt":
                    return gptAvatar;
                  case "error":
                    return warning;
                  default:
                    return user;
                }
              };

              const getMessage = () => {
                if (message.slice(0, 2) == "\n\n") {
                  return message.slice(2, Infinity);
                }

                return message;
              };

              return (
                <Stack
                  key={key}
                  direction="row"
                  padding={4}
                  rounded={8}
                  backgroundColor={
                    emitter == "gpt" ? "blackAlpha.200" : "transparent"
                  }
                  spacing={4}
                >
                  <Avatar name={emitter} src={getAvatar()} />
                  <Text
                    whiteSpace="pre-wrap"
                    marginTop=".75em !important"
                    overflow="hidden"
                  >
                    <ReactMarkdown>{getMessage()}</ReactMarkdown>
                  </Text>
                </Stack>
              );
            })
          ) : (
            <Instructions onClick={(text) => setValue("input", text)} />
          )}
        </Stack>
      </Stack>
      <Stack
        height="20%"
        padding={4}
        backgroundColor="blackAlpha.400"
        justifyContent="center"
        alignItems="center"
        overflow="hidden"
      >
        <Stack maxWidth="768px">
          <Input
            autoFocus={true}
            variant="filled"
            inputRightAddon={
              <IconButton
                aria-label="send_button"
                icon={!isLoading ? <FiSend /> : <Spinner />}
                backgroundColor="transparent"
                onClick={handleSubmit(handleAsk)}
              />
            }
            {...register("input")}
            onSubmit={console.log}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                handleAsk({ input: e.currentTarget.value });
              }
            }}
          />
          <Text textAlign="center" fontSize="sm" opacity={0.5}>
            GovAI Our goal is to make AI systems more natural and safe to
            interact with user for document requirements and there needs.Your
            feedback will help us improve.
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
};
